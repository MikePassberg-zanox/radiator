$( initialize() )
//var re = /^([A-Z]*)-([A-Za-z]*_[0-9][a-zA-Z]{0,1})-(Staging|Build|Quality|Live|TeamDev)/;
var re = /^([A-Z]*)-(.*)/;

function initialize(){
	loaddata();
	//setInterval(function(){loaddata();},1000);
}

function loaddata()
{
	$.get("https://jenkins.zanox.com/api/json?jsonp=?", function (data){
		var jobs = [];
		var groups = groupdata(data);
		var classes = {}
		classes[true] = "failedbuilds"
		classes[false] = "allsuccess"
		var containerdiv = $("<div/>", {
				"class": "projectoverview"
			}
		);
		var infobox = $("<div/>", {"class": "infobox"});
		var successcounttotal = $("<div/>", {"class": "successcounttotal", html: 0});
		var failcounttotal = $("<div/>", {"class": "failcounttotal", html: 0});
		var buildcounttotal = $("<div/>", {"class": "buildcounttotal", html: 0});
		var disabledcounttotal = $("<div/>", {"class": "disabledcounttotal", html: 0});
		var showHideButton = $('<input>', {"style": "position: fixed;top: 10px;right: 30px;width: 80px;height: 25px;", "id": "offbutton", "type": "button", "value": "Show/Hide", "onClick": "toggleButton()"});
		var legendBox = $("<div/>", {"id": "legend", "title": "Legend","class":"ui-state-default ui-corner-all", html: '<table style="border: 0;"><tr><td></td><td>Individual Statistics</td></tr><tr><td style="background: #B0B0B0; height: 30px;width: 30px;"></td><td>&nbsp;&nbsp;Total</td></tr><tr><td style="background: #FE0000; height: 30px;width: 30px;"></td><td>&nbsp;&nbsp;Failed</td></tr><tr><td style="background: #00ED00; height: 30px;width: 30px;"></td><td>&nbsp;&nbsp;Success</td></tr><tr><td>&nbsp;</td></tr><tr><td></td><td>Infobox Statistics</td></tr><tr><td style="background: rgba(0,200,0,.8); height: 30px;width: 30px;"></td><td>&nbsp;&nbsp;Success Total</td></tr><tr><td style="background: rgba(230,0,0,.8); height: 30px;width: 30px;"></td><td>&nbsp;&nbsp;Failed Total</td></tr><tr><td style="background-color: rgba(235,235,0,.8); height: 30px;width: 30px;"></td><td>&nbsp;&nbsp;Building Total</td></tr><tr><td style="background: rgba(0,0,235,.8); height: 30px;width: 30px;"></td><td>&nbsp;&nbsp;Disabled Total</td></tr></table>'});

		infobox.append(successcounttotal).append(failcounttotal).append(buildcounttotal).append(disabledcounttotal);
		$.each(groups, function (key, val)
			{
				projectdiv = $("<div/>",{"class": (val.red_anime>0 || val.blue_anime >0 || val.yellow_anime > 0) ? "project" : "project_building"})
				domain = $("<div/>",{"class": classes[(val.red > 0 || val.red_anime > 0)], html: key})
				counts = $("<div/>",{"class": "counts"})
				totaljobcount = $("<div/>", {"class": "total",html: val.projects.length})
				failedjobcount = $("<div/>",{"class": "failed", html: ($.isNumeric(val.red) ? val.red : 0 + $.isNumeric(val.red_anime) ? val.red_anime : 0)})
				successjobcount = $("<div/>", {"class": "success", html: ($.isNumeric(val.blue) ? val.blue : 0 + $.isNumeric(val.blue_anime) ? val.blue_anime : 0)})

				counts.append(totaljobcount).append(failedjobcount).append(successjobcount);
				projectdiv.append(domain).append(counts);

				containerdiv.append(projectdiv);

				successcounttotal.html(function(index,oldhtml){return ($.isNumeric(val.blue) ? val.blue : 0) + parseInt(oldhtml)})
				failcounttotal.html(function(index,oldhtml){return ($.isNumeric(val.red) ? val.red : 0) + parseInt(oldhtml)})
				buildcounttotal.html(function(index,oldhtml){
					return ($.isNumeric(val.blue_anime) ? val.blue_anime : 0) + ($.isNumeric(val.yellow_anime) ? val.yellow_anime : 0) + ($.isNumeric(val.red_anime) ? val.red_anime : 0) + parseInt(oldhtml)
				})
				disabledcounttotal.html(function(index,oldhtml){return ($.isNumeric(val.disabled) ? val.disabled : 0) + parseInt(oldhtml)})

				//jobs.push("<div class=\"project\"><div class=\""+ classes[(val.red > 0)] +"\">"+ key + "</div><div>" + val.projects.length + "</div></div>");
			}
		);
		//$("body").empty();
		containerdiv.appendTo("body");
		infobox.appendTo("body");
		showHideButton.appendTo("body");
		legendBox.appendTo("body");
		$( "#legend" ).dialog({ position: { my: "right top", at: "right-30 top+50", of: window } });
	}, "jsonp");
return
}

function groupdata(data)
{
	var groups = {};
	$.each(data.jobs, function (key, value)
		{
			var projectparts = re.exec(value.name);
			if(projectparts != null) {
				if($.isEmptyObject(groups[projectparts[1]]))
				{
					groups[projectparts[1]] = {projects: []};
				}
				groups[projectparts[1]].projects.push({name: projectparts[2], status: value.color});
				if(! $.isNumeric(groups[projectparts[1]][value.color]))
				{
					groups[projectparts[1]][value.color] = 0;
				}
				groups[projectparts[1]][value.color]++;
			}
		}
	)
	//console.log(groups);
	return groups
}

function toggleButton () {
  $("div.infobox").toggle();
}