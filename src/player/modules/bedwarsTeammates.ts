import axios from 'axios';
import { config } from '../..';
import PlayerModule from '../PlayerModule';

const playerModule = new PlayerModule(
  'BedwarsTeammates',
  'Add support for TeamView in Bedwars'
);

playerModule.customCode = () => {
  const player = playerModule.player;
  if (!config.bedwarsTeammates) return;

  player.listener.on('team_create', (name) => {
    const existingTeam = player.teams.find((team) => team.name === name);
    if (existingTeam) return;
    player.teams.push({
      name,
      players: [],
    });
  });

  player.listener.on('team_delete', (name) => {
    player.teams = player.teams.filter((team) => team.name !== name);
  });

  player.listener.on('team_player_add', (name, players) => {
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
