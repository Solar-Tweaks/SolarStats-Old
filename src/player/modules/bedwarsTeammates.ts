import axios from 'axios';
import { config } from '../..';
import Item from '../../Classes/Item';
import PlayerModule from '../PlayerModule';

const settingItem = new Item(355);
settingItem.displayName = '§fBedwars Teammates';
settingItem.lore = [
  '',
  '§7Adds support for Lunar',
  '§7TeamView mod in Bedwars',
  '',
  `§7Current: §${config.modules.bedwarsTeammates ? 'aEnabled' : 'cDisabled'}`,
];

const playerModule = new PlayerModule(
  'BedwarsTeammates',
  'Add support for TeamView in Bedwars',
  settingItem,
  'bedwarsTeammates'
);

playerModule.customCode = () => {
  const player = playerModule.player;

  player.listener.on('team_create', (name) => {
    if (!config.modules.bedwarsTeammates) return;
    const existingTeam = player.teams.find((team) => team.name === name);
    if (existingTeam) return;
    player.teams.push({
      name,
      players: [],
    });
  });

  player.listener.on('team_delete', (name) => {
    if (!config.modules.bedwarsTeammates) return;
    player.teams = player.teams.filter((team) => team.name !== name);
  });

  player.listener.on('team_player_add', (name, players) => {
    if (!config.modules.bedwarsTeammates) return;
    player.teams.find((team) => team.name === name)?.players.push(...players);

    const playerTeam = player.teams.find((team) =>
      team.players.includes(player.client.username)
    );

    if (!playerTeam) return;
    if (playerTeam?.name !== name) return;

    const bedwarsTeams = [
      'Red',
      'Blue',
      'Green',
      'Yellow',
      'Aqua',
      'White',
      'Pink',
      'Gray',
    ];
    bedwarsTeams.forEach(async (bedwarsTeam) => {
      if (!playerTeam.name.startsWith(bedwarsTeam)) return;

      await new Promise((resolve) => setTimeout(resolve, 500));
      const allTeams = player.teams.filter((team) =>
        team.name.startsWith(bedwarsTeam)
      );
      const uuids: string[] = [];
      for (const team of allTeams) {
        for (const player of team.players) {
          const response = await axios
            .get(`https://api.mojang.com/users/profiles/minecraft/${player}`)
            .catch(() => {
              // Ignoring fake players
            });
          if (response) uuids.push(response.data.id);
        }
      }
      uuids.forEach((uuid) => {
        if (uuid === undefined) return;

        player.lcPlayer.addTeammate(
          uuid.substr(0, 8) +
            '-' +
            uuid.substr(8, 4) +
            '-' +
            uuid.substr(12, 4) +
            '-' +
            uuid.substr(16, 4) +
            '-' +
            uuid.substr(20)
        );
      });
      // await this.sendTeammates();
    });
  });
};

export default playerModule;
