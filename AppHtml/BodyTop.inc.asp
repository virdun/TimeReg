<div id="Table">
    <div id="header">
        <div id="header-left">
        </div>
        <div id="header-right">
        </div>
        <div id="company-logo" style="padding-right: 20px;">
            <% If (bUserLoggedIn) Then %>
                Logged in as: <b><%=sLoginName%></b> <a href="login.asp?action=logout">[logout]</a>
            <% Else %>
                Not logged in <a href="login.asp">[login]</a>
            <% End If %>
        </div>
        <div id="header-main">
            <h1 style=" float: left; 
                        font-size: 20px; 
                        color: #ffffff;
                        font-family: monospace;
                        padding-top: 10px;
                        "
            >Work hour time tracker</h1>
            <ul vdfControlType="vdf.gui.DropDownMenu" class="DropDownMenu">
                <li><a href="Default.asp">Home</a></li>
                <li><a href="Login.asp">Login</a></li>
                <li class="middleli"><a>||</a></li>
                <li><a href="">Data Entry</a>
                    <ul>
                        <li><a href="CustomerPopup.asp">Customers</a></li>
                        <li><a href="Project.asp">Projects</a></li>
                        <li><a href="User.asp">Users</a></li>
                        <li><a href="UserProj.asp">User projects</a></li>
                    </ul>
                </li>
                <li class="middleli"><a>||</a></li>
                <li><a href="">Reporting</a>
                    <ul>
                        <!-- <li><a href="CustomerReport.asp">Customer list</a></li> -->
                        <li><a href="DayReportJson.asp">Day Report</a></li>
                        <li><a href="ProjectsDetailsInterface.asp">Project Details Report</a></li>
                        <!-- <li><a href="ProjectReport.asp">Project Overview Report</a></li> -->
                    </ul>
                </li>
            </ul>
        </div>

        
    </div>
    
	<div id="content"> 