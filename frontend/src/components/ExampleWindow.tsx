import {
  Window,
  WindowHeader,
  WindowTitle,
  WindowDescription,
  WindowContent,
  WindowFooter,
} from "./ui/window";

function ExampleWindow() {
  return (
    <Window title="Neobrutalism Window">
      <WindowHeader>
        <WindowTitle>Welcome to the Window!</WindowTitle>
        <WindowDescription>
          This is a draggable neobrutalism-style window component.
        </WindowDescription>
      </WindowHeader>

      <WindowContent>
        <p>
          You can drag this window by clicking and holding the header bar. Click the colored
          buttons in the header to see the animated "click" effect!
        </p>
        <div className="mt-4 p-4 bg-secondary-background border-2 border-border rounded-base">
          <h3 className="font-heading mb-2">Window Features:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Draggable by header bar</li>
            <li>Animated click effects on header buttons</li>
            <li>Neobrutalism styling with thick borders and shadows</li>
            <li>Minimize, maximize, and close functionality</li>
          </ul>
        </div>
      </WindowContent>

      <WindowFooter>
        <span className="text-sm">Window Footer Content</span>
      </WindowFooter>
    </Window>
  );
}

export default ExampleWindow;
