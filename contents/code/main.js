try {
	this.windowsToDodge = readConfig("Dodge.toDodge", "firefox").split(",");
	this.windowsThatDodge = readConfig("Dodge.dodgers", "vlc").split(",");
} catch(err) {
	this.windowsToDodge = new Array("firefox");
	this.windowsThatDodge = new Array("vlc");
}
this.desktops = [];
var self = this;

function buildDesktopList() {
	self.desktops = [];
	for (var i = 0; i < workspace.clientList.length; i++) {
		var client = workspace.clientList[i];
		if (self.windowsToDodge.indexOf(client.resourceClass.toString()) != -1) {
			if (client.onAllDesktops == false) {
				self.desktops.push(client.desktop);
			}
		}
	}
};

function findDesktop(client) {
	// Choose the next "free" desktop
	for (var i = workspace.currentDesktop;
		 i < workspace.desktops + workspace.currentDesktop; i++) {
		if (self.desktops.indexOf(i % workspace.desktops) == -1) {
			client.desktop = i % workspace.desktops;
			return;
		}
	}
};

workspace.clientAdded.connect(function(client) {
	if (self.windowsThatDodge.indexOf(client.resourceClass.toString()) != -1) {
		if (self.desktops.indexOf(client.desktop) != -1 || client.onAllDesktops == true) {
			findDesktop(client);
		}
	} else if (self.windowsToDodge.indexOf(client.resourceClass.toString()) != -1) {
		if (client.onAllDesktops == false && self.desktops.indexOf(client.desktop) == -1) {
			self.desktops.push(client.desktop);
		}
	}
});

workspace.clientRemoved.connect(function(client) {
	if (self.windowsToDodge.indexOf(client.resourceClass.toString()) != -1) {
		buildDesktopList();
	}
});
	
workspace.desktopPresenceChanged.connect(function(client, desktop) {
	if (self.windowsToDodge.indexOf(client.resourceClass.toString()) != -1) {
		buildDesktopList();
		// This is called _before_ the desktop change, so add this one in
		if (self.desktops.indexOf(client.desktop) == -1 && client.onAllDesktops == false) {
			self.desktops.push(client.desktop);
		}
	}
});

buildDesktopList();
