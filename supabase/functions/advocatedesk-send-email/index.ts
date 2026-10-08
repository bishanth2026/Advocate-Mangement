import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL=Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY=Deno.env.get("RESEND_API_KEY")||"";
const FROM_EMAIL=Deno.env.get("ADVOCATEDESK_FROM_EMAIL")||"";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json"};

function out(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:cors});}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
  if(req.method!=="POST")return out({error:"Method not allowed"},405);
  if(!RESEND_API_KEY||!FROM_EMAIL)return out({error:"Email service is not configured. Set RESEND_API_KEY and ADVOCATEDESK_FROM_EMAIL in Supabase Edge Function secrets."},503);
  const h=req.headers.get("Authorization")||"";
  const token=h.startsWith("Bearer ")?h.slice(7):"";
  if(!token)return out({error:"Missing authorization token."},401);
  const auth=await fetch(SUPABASE_URL+"/auth/v1/user",{headers:{apikey:SERVICE_ROLE_KEY,Authorization:"Bearer "+token}});
  if(!auth.ok)return out({error:"Invalid or expired session."},401);
  const user=await auth.json();
  let body:any;try{body=await req.json()}catch(_){return out({error:"Invalid JSON body."},400);}
  const workspaceId=String(body?.workspaceId||"").trim();
  const to=String(body?.to||"").trim().toLowerCase();
  const subject=String(body?.subject||"").trim();
  const html=String(body?.html||"").trim();
  const text=String(body?.text||"").trim();
  if(!workspaceId||!to||!subject||!html||!text)return out({error:"workspaceId, to, subject, html and text are required."},400);
  if(to.indexOf("@")<1||to.indexOf(".")<3)return out({error:"Invalid recipient email address."},400);
  const membership=await fetch(SUPABASE_URL+"/rest/v1/workspace_members?workspace_id=eq."+encodeURIComponent(workspaceId)+"&user_id=eq."+encodeURIComponent(user.id)+"&select=workspace_id,role,workspaces!inner(status)",{headers:{apikey:SERVICE_ROLE_KEY,Authorization:"Bearer "+SERVICE_ROLE_KEY}});
  if(!membership.ok)return out({error:"Could not verify workspace access."},500);
  const members=await membership.json();
  if(!Array.isArray(members)||!members.length||members[0]?.workspaces?.status!=="active")return out({error:"You are not authorized to send email from this workspace."},403);
  const resend=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+RESEND_API_KEY},body:JSON.stringify({from:FROM_EMAIL,to:[to],subject,html,text,tags:[{name:"source",value:"advocatedesk"},{name:"workspace",value:workspaceId}]})});
  const data=await resend.json().catch(()=>({}));
  if(!resend.ok)return out({error:data?.message||"Email provider rejected the message."},502);
  return out({ok:true,id:data?.id||null,recipient:to});
});
