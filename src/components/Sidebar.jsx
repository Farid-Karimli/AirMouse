import * as React from "react";
import RowRadioButtonsGroup from "./RadioForm.jsx";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h3>Settings</h3>
      <p>
        This is where you can edit the settings for the AirMouse. The input
        below does not do anything at the moment.
      </p>

      <div id="settings">
        <RowRadioButtonsGroup
          name={"Hand"}
          labels={["Left", "Right"]}
          active={"Right"}
        />
      </div>
    </div>
  );
};

export default Sidebar;
