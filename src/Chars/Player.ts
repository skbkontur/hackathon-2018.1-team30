import spriteSheetFactory from "../SpriteSheets/SlawwanSpriteSheet";
import DirectionActor from "./DirectionActor";
import LaserSable from "./LaserSable";
import { HealthLine } from "./HealthLine";
import * as ex from "excalibur";
import ChickenFowl from "./ChickenFowl";
import PoopFowl from "./PoopFowl";
import Swabra from "./Swabra";

export default class Player extends DirectionActor {
  private readonly spriteSheet = spriteSheetFactory();
  private fireTarget: ex.Vector | null = null;

  private laserSalbe: Swabra | null = null;
  private swabra: Swabra | null = null;

  private gunFireKillInterval: number | null = null;

  public nextPosition: ex.Vector = ex.Vector.Zero;

  constructor(x: number, y: number) {
    super(x, y, 0, 0);
    this.setWidth(this.spriteSheet.width);
    this.setHeight(this.spriteSheet.height);
    this.collisionType = ex.CollisionType.Active;
    const area = new ex.Actor(x, y, 20, 100).collisionArea;
    area.body = this.body;
    this.collisionArea = area;
  }

  public onInitialize(engine: ex.Engine) {
    super.onInitialize(engine);
    this.registerDrawing({
      idle: {
        up: this.spriteSheet.idle.up(),
        down: this.spriteSheet.idle.down(),
        right: this.spriteSheet.idle.right(),
        left: this.spriteSheet.idle.left(),
        up_left: this.spriteSheet.idle.up_left(),
        up_right: this.spriteSheet.idle.up_right(),
        down_left: this.spriteSheet.idle.down_left(),
        down_right: this.spriteSheet.idle.down_left()
      },
      walk: {
        up: this.spriteSheet.walk.up(engine, 75),
        up_right: this.spriteSheet.walk.up_right(engine, 75),
        up_left: this.spriteSheet.walk.up_left(engine, 75),
        down: this.spriteSheet.walk.down(engine, 75),
        down_right: this.spriteSheet.walk.down_right(engine, 75),
        down_left: this.spriteSheet.walk.down_left(engine, 75),
        right: this.spriteSheet.walk.right(engine, 75),
        left: this.spriteSheet.walk.left(engine, 75)
      }
    });
  }

  public update(engine: ex.Engine, delta: number) {
    super.update(engine, delta);
    const positionDifferent = this.nextPosition.sub(this.pos);
    if (!positionDifferent.equals(ex.Vector.Zero)) {
      this.pos = this.nextPosition;
    }
    if (this.fireTarget) {
      this.direction = positionDifferent;
      if (this.laserSalbe == null) {
        this.laserSalbe = new Swabra(() => ex.Vector.Zero);
        this.add(this.laserSalbe);
      }
      this.laserSalbe.target = this.fireTarget;
    }
  }

  public set setFireTarget(target: ex.Vector) {
    if (this.gunFireKillInterval) {
      clearInterval(this.gunFireKillInterval);
    }
    this.fireTarget = target;
    this.gunFireKillInterval = setInterval(() => {
      this.fireTarget = null;
      if (this.laserSalbe) {
        this.remove(this.laserSalbe);
        this.laserSalbe = null;
      }
    }, 100);
  }
}
