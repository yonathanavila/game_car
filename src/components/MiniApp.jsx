import { useEffect } from "preact/hooks";
import Game from "@/components/phaser/Game";

export default function MiniApp() {

  useEffect(() => {
    new Game(); // Initialize Phaser game only once
  }, []);

  return (
    <div className="App">
      <div id="game-container"></div>
    </div>
  );
}
