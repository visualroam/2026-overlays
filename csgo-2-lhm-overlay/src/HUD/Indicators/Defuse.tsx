import { Player } from 'csgogsi';
import {Defuse as DefuseIcon} from './../../assets/Icons';
const Defuse = ({ player }: { player: Player }) => {
        if(!player.state.health || !player.state.defusekit) return '';
        return (
            <div className={`armor-indicator defuse-indicator`}>
                <DefuseIcon height="25px" width="25px" />
            </div>
        );
}
export default Defuse;
