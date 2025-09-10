import { useState } from 'react';
import { useNavigation } from '@/lib/navigation-system/NavigationProvider';
import { useGameStateManager } from '@/context/GameStateContext';
import { GroupName } from '@/lib/navigation-system/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function PlayerSelect() {
  const { navigateTo } = useNavigation();
  const gameStateManager = useGameStateManager();
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = () => {
    if (playerName.trim()) {
      gameStateManager.playerName = playerName.trim();
      navigateTo(GroupName.INIT_GROUP, 'round-select');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Enter Your Name</h1>
          <p className="text-muted-foreground">Please enter your name to continue</p>
        </div>

        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full"
            autoFocus
          />

          <Button
            onClick={handleSubmit}
            disabled={!playerName.trim()}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
