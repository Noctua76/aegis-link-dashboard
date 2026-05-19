import { useEffect, useState } from "react";

function AdminAuditLogs() {

const [sessions,setSessions] = useState([]);

useEffect(()=>{

fetch(
"https://noctua-panic-backend-production.up.railway.app/admin/sessions/history"
)
.then(res=>res.json())
.then(data=>{

if(data.status==="ok"){
setSessions(data.sessions);
}

});

},[]);

return (

<div style={{padding:"20px"}}>

<h2>Admin Audit Logs</h2>

<table
style={{
width:"100%",
borderCollapse:"collapse"
}}
>

<thead>

<tr>

<th>User</th>
<th>Role</th>
<th>Login</th>
<th>Logout</th>
<th>Duration</th>
<th>Status</th>

</tr>

</thead>

<tbody>

{sessions.map(session=>(

<tr key={session.id}>

<td>{session.username}</td>

<td>{session.role}</td>

<td>{session.login_time}</td>

<td>{session.logout_time || "-"}</td>

<td>
{session.session_duration_seconds || "-"}
</td>

<td>
{session.is_active
? "ACTIVE"
: "CLOSED"}
</td>

</tr>

))}

</tbody>

</table>

</div>

);

}

export default AdminAuditLogs;
