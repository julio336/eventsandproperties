// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create tab group
var tabGroup = Titanium.UI.createTabGroup();


//
// create base UI tab and root window
//
var win1 = Titanium.UI.createWindow({  
    title:'Tab 1',
    backgroundColor:'#fff'
});

var buttonLaunchDialog = Titanium.UI.createButton({
	title: 'Launch OptionDialog',
	top: 110,
	left: 20,
	width: 280,
	height: 40
});

function optionDialogEventHandler(e){
	alert(e.source + 'index pressed was '+ e.index);
}

buttonLaunchDialog.addEventListener('click', function(e){
	Ti.API.info(e.source + 'was tapped, it has a title of: ');
	Ti.API.info(e.source.title);
	
	var dialog = Titanium.UI.createOptionDialog({
		options:['More than words can say!', 'Lots!', 'It is ok...', 'I hate ice cream', 'Cancel'],
		cancel: 4,
		title: 'How much do you like ice cream?'
	});
	dialog.addEventListener('click', optionDialogEventHandler);
	dialog.show();
});

win1.add(buttonLaunchDialog);


var buttonSetProperties = Titanium.UI.createButton({
	title:'Set properties!',
	top: 50,
	left: 20,
	width: 280,
	height: 40
});

buttonSetProperties.addEventListener('click', function(e){
	Titanium.App.Properties.setString('myString', 'Hello World!');
	Titanium.App.Properties.setBool('myBool', true);
	Titanium.App.Properties.setDouble('myDouble', 345.12);
	Titanium.App.Properties.setInt('myInteger', 11);
	Titanium.App.Properties.setList('myList', ['The first value', 'The second value', 'The third value']);
	alert('Your app properties have been set!');
});

win1.add(buttonSetProperties);


var tab1 = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'Tab 1',
    window:win1
});



//
// create controls tab and root window
//
var win2 = Titanium.UI.createWindow({  
    title:'Tab 2',
    backgroundColor:'#fff'
});

var webview = Titanium.UI.createWebView({
	url: 'webevent.html',
	width: 320,
	height: 100,
	bottom: 0
});

var labelCopiedText = Titanium.UI.createLabel({
	width: 'auto',
	height: 'auto',
	value: '',
	bottom: 120
});

win2.add(labelCopiedText);

Ti.App.addEventListener('webviewEvent', function(e){
	labelCopiedText.text = e.text;
});
win2.add(webview);

var buttonCheckForProperty = Titanium.UI.createButton({
	title: 'Check Property?',
	top: 50,
	left: 20,
	width: 280,
	height: 40
});

buttonCheckForProperty.addEventListener('click', function(e){
	if(Titanium.App.Properties.hasProperty('myString')){
		Ti.API.info('The myString property exits!');
	}
	if (!Titanium.App.Properties.hasProperty('someOtherString')){
		Ti.API.info('The someOtherString property does not exist.');
	}
});

win2.add(buttonCheckForProperty);

var buttonGetProperties = Titanium.UI.createButton({
	title: 'Get Properties!',
	top: 90,
	left: 20,
	width: 280,
	height: 40
});

buttonGetProperties.addEventListener('click', function(e){
	Ti.API.info('myString property = ' + Titanium.App.Properties.getString('myString'));
	Ti.API.info('myBool property = ' + Titanium.App.Properties.getBool( 'myBool' ) ) ;
	Ti.API.info('myDouble property = ' + Titanium.App.Properties.getDouble('myDouble'));
	Ti.API.info('myInteger property = ' + Titanium.App.Properties.getInt('myInteger'));
	Ti.API.info('myList property = ' +	Titanium.App.Properties.getList('myList')) ;
}); 
	
win2.add(buttonGetProperties);

var tab2 = Titanium.UI.createTab({  
    icon:'KS_nav_ui.png',
    title:'Tab 2',
    window:win2
});


//
//  add tabs
//
tabGroup.addTab(tab1);  
tabGroup.addTab(tab2);  


// open tab group
tabGroup.open();
