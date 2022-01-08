import Command from "../Classes/Command";

const reqeue = new Command("reqeue", ["rq", "req"]);

reqeue.onTriggered = () => {
  const lastGameMode = reqeue.player.lastGameMode;
  if (lastGameMode)
    reqeue.player.executeCommand(`/play ${lastGameMode.toLowerCase()}`);
  else
    reqeue.player.sendMessage(
      "§cYou have not played a game since you connected!"
    );
};

export default reqeue;
