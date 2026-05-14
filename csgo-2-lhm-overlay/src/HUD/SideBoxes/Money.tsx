import React from "react";
import "./sideboxes.scss";

const LossBox = React.memo(({ active, side, count }: { active: boolean; side: "CT" | "T"; count: number }) => {
  return (
    <div
      className={`loss-box ${side} ${
        active ? "active" : ""
      }`}
    >

    </div>
  );
});

interface Props {
  side: "left" | "right";
  team: "CT" | "T";
  loss: number;
  equipment: number;
  money: number;
  show: boolean;
}

const Money = ({ side, team, loss, equipment, money, show }: Props) => {
  return (
    <div className={`moneybox ${side} ${team} ${show ? "show" : "hide"}`}>
      <div className="loss_container" aria-hidden>
        <LossBox side={team} active={(loss - 1400) / 500 >= 4} count={4} />
        <LossBox side={team} active={(loss - 1400) / 500 >= 3} count={3} />
        <LossBox side={team} active={(loss - 1400) / 500 >= 2} count={2} />
        <LossBox side={team} active={(loss - 1400) / 500 >= 1} count={1} />
      </div>
      <div className="money_container">
        <div className="title">Loss bonus</div>
        <div className="value"><span>$</span>{loss.toLocaleString()}</div>
      </div>
      <div className="money_container">
        <div className="title">Team money</div>
        <div className="value"><span>$</span>{money.toLocaleString()}</div>
      </div>
      <div className="money_container">
        <div className="title">Equipment</div>
        <div className="value"><span>$</span>{equipment.toLocaleString()}</div>
      </div>
    </div>
  );
};
export default Money;
