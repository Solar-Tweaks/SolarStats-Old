(async () => {
  // SettingItem is the item used in the settings page (`/solarstats`)
  const settingItem = new toolbox.Item(358);
  settingItem.displayName = '§fSwitch Server';
  settingItem.lore = [
    '',
    '§7Send a message when',
    '§7your location updates',
    '',
    `§7Current: §${
      (await toolbox.getConfig().switchServer) ? 'aEnabled' : 'cDisabled'
    }`,
  ];

  // Creating the player module with the required arguments
  const module = new toolbox.PlayerModule(
    'SwitchServer', // Module name
    "Send a message when the player's location is updated", // Module description
    // If you don't want to create an item in the settings page skip the two following arguments
    settingItem, // Setting item created above
    'switchServer' // The config key
  );

  module.onLocationUpdate = async () => {
    // This code is executed every time the player's location is updated a.k.a. every time the player changes server on hypixel
    if (!(await toolbox.getConfig()).switchServer) return;
    player.sendMessage('Your location has been updated');
  };

  // Registering the module
  registerPlayerModule(module);
})();

// Registering the plugin, always put this at the end of the file
registerPlugin({
  name: 'Switch Server',
  description: "Send a message when the player's location is updated",
  version: '1.0.0', // Optional
  author: 'RichardDorian', // Optional
});
