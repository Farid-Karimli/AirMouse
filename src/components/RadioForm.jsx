import * as React from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

export default function RowRadioButtonsGroup({ name, labels, active }) {
  return (
    <FormControl>
      <FormLabel id="demo-row-radio-buttons-group-label">{name}</FormLabel>
      <RadioGroup
        row
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="row-radio-buttons-group"
        defaultValue={active}
      >
        {labels.map((label, index) => {
          return (
            <FormControlLabel
              key={index}
              value={label}
              control={<Radio />}
              label={label}
            />
          );
        })}
      </RadioGroup>
    </FormControl>
  );
}
