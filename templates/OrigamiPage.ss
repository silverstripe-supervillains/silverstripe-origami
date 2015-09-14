<!DOCTYPE html>
<!--[if !IE]><!-->
<html lang="$ContentLocale">
	<!--<![endif]-->
	<!--[if IE 6 ]><html lang="$ContentLocale" class="ie ie6"><![endif]-->
	<!--[if IE 7 ]><html lang="$ContentLocale" class="ie ie7"><![endif]-->
	<!--[if IE 8 ]><html lang="$ContentLocale" class="ie ie8"><![endif]-->
	<head>
		<base href="{$BaseHref}admin/origami/"></base>
		<title>$SiteConfig.Title | $Title</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		$MetaTags(false)
		<!--[if lt IE 9]>
		<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
		<![endif]-->

		<link rel="shortcut icon" href="$ThemeDir/images/favicon.ico" />
	</head>

	<body ng-app="origami" ngCloak>
		<div cms-sidenav></div>
		<div class="main">
			<div class="container-fluid">
				<div class="row" cms-header></div>
				<div class="row" notification></div>
				<div class="row">
					<div class="col-sm-12" ng-view></div>
				</div>
			</div>
		</div>

		<script type="text/javascript">
			window.serverConfig = {
				"BaseHref": "$BaseHref",
				"ThemeDir": "$ThemeDir",
				"OrigamiDir": "$OrigamiDir",
				"WebSocket": {
					"URL": "$baseURL",
					"port": "8080",
					"endpoint": "/admin/api/origami/"
				}
			}
		</script>
	</body>

</html>
