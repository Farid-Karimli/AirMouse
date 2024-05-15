import * as React from "react";
import RowRadioButtonsGroup from "./RadioForm.jsx";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h3>Settings</h3>
      <p>
        This is where you can edit the sensitivity of the cursor and gestures.
      </p>

      <div id="settings">
        <RowRadioButtonsGroup name={"Hand"} labels={["Left", "Right"]} />
      </div>
    </div>
  );
};

export default Sidebar;
