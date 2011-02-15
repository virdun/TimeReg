<%
  callback = Request.QueryString( "callback" )
  json = "{ ""firstName"": ""John"", ""age"": 25 }"
  
  Response.Write( callback & "(" & json & ");" )
%>