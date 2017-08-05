import {Operation} from "./Operation";
import {ScoutMission} from "../missions/ScoutMission";
import {MiningMission} from "../missions/MiningMission";
import {RemoteBuildMission} from "../missions/RemoteBuildMission";
import {GeologyMission} from "../missions/GeologyMission";
import {ReserveMission} from "../missions/ReserveMission";
import {BodyguardMission} from "../missions/BodyguardMission";
import {EnhancedBodyguardMission} from "../missions/EnhancedBodyguardMission";
import {OperationPriority, MAX_HARVEST_DISTANCE, MAX_HARVEST_PATH} from "../../config/constants";
import {ROOMTYPE_CORE, WorldMap} from "../WorldMap";
import {InvaderGuru} from "../missions/InvaderGuru";
import {Mission} from "../missions/Mission";
import {PaverMission} from "../missions/PaverMission";
export class MiningOperation extends Operation {
    private invaderGuru: InvaderGuru;

    /**
     * Remote mining, spawns Scout if there is no vision, spawns a MiningMission for each source in the missionRoom. Can
     * also mine minerals from core rooms
     * @param flag
     * @param name
     * @param type
     * @param empire
     */

    constructor(flag: Flag, name: string, type: string) {
        super(flag, name, type);
        this.priority = OperationPriority.Low;
    }

    public init() {

        this.updateRemoteSpawn(MAX_HARVEST_DISTANCE, 3, 50);
        let foundSpawn = this.assignRemoteSpawn();
        if (!foundSpawn) { return; }

        if (this.spawnGroup.room.controller.level < 3) { return; }

        this.addMission(new ScoutMission(this));

        this.invaderGuru = new InvaderGuru(this);
        this.invaderGuru.init();
        // defense
        if (this.flag.room && WorldMap.roomType(this.flag.pos.roomName) === ROOMTYPE_CORE) {
            this.addMission(new EnhancedBodyguardMission(this, this.invaderGuru));
            this.addMission(new GeologyMission(this));
        } else {
            this.addMission(new BodyguardMission(this, this.invaderGuru));
        }

        if (!this.flag.room) { return; }

        ReserveMission.Add(this);
        MiningMission.Add(this, false);

        this.addMission(new PaverMission(this));
        this.addMission(new RemoteBuildMission(this, false, true));
    }

    public update() {
        this.updateRemoteSpawn(MAX_HARVEST_DISTANCE, 3, 50);
        if (this.invaderGuru) {
            this.invaderGuru.update();
        }
    }

    protected bypassActions() {
        let bypassMissions = {};
        if (this.missions["bodyguard"]) { bypassMissions["bodyguard"] = this.missions["bodyguard"]; }
        if (this.missions["defense"]) { bypassMissions["defense"] = this.missions["defense"]; }
        Mission.actions(bypassMissions);
    }

    public finalize() {
    }
    public invalidateCache() {
    }
}
