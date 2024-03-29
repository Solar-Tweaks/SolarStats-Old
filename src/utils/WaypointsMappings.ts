import { WaypointsMappings as _WaypointsMappings } from '../Types';

enum WaypointColor {
  RED = 0xff0000,
  BLUE = 0x0000ff,
  GREEN = 0x00ff00,
  YELLOW = 0xffff00,
  AQUA = 0x00ffff,
  WHITE = 0xffffff,
  PINK = 0xff00ff,
  GRAY = 0x808080,
}

const WaypointsMappings: _WaypointsMappings = {
  Lighthouse: [
    {
      modes: ['BEDWARS_EIGHT_ONE', 'BEDWARS_EIGHT_TWO'],
      waypoints: [
        {
          name: 'Red',
          x: -23.5,
          y: 66,
          z: -75.5,
          color: WaypointColor.RED,
          forced: false,
          visible: true,
        },
        {
          name: 'Blue',
          x: 29.5,
          y: 66,
          z: -75.5,
          color: WaypointColor.BLUE,
          forced: false,
          visible: true,
        },
        {
          name: 'Green',
          x: 78.5,
          y: 66,
          z: -26.5,
          color: WaypointColor.GREEN,
          forced: false,
          visible: true,
        },
        {
          name: 'Yellow',
          x: 78.5,
          y: 66,
          z: 26.5,
          color: WaypointColor.YELLOW,
          forced: false,
          visible: true,
        },
        {
          name: 'Aqua',
          x: 29.5,
          y: 66,
          z: 75.5,
          color: WaypointColor.AQUA,
          forced: false,
          visible: true,
        },
        {
          name: 'White',
          x: -23.5,
          y: 66,
          z: 75.5,
          color: WaypointColor.WHITE,
          forced: false,
          visible: true,
        },
        {
          name: 'Pink',
          x: -72.5,
          y: 66,
          z: 26.5,
          color: WaypointColor.PINK,
          forced: false,
          visible: true,
        },
        {
          name: 'Gray',
          x: -72.5,
          y: 66,
          z: -26.5,
          color: WaypointColor.GRAY,
          forced: false,
          visible: true,
        },
      ],
    },
  ],
  Yue: [
    {
      modes: ['BEDWARS_EIGHT_ONE'],
      waypoints: [
        {
          name: 'Red',
          x: -71.5,
          y: 81,
          z: 28.5,
          color: WaypointColor.RED,
          forced: false,
          visible: true,
        },
        {
          name: 'Blue',
          x: -71.5,
          y: 81,
          z: -28.5,
          color: WaypointColor.BLUE,
          forced: false,
          visible: true,
        },
        {
          name: 'Green',
          x: -28.5,
          y: 81,
          z: -71.5,
          color: WaypointColor.GREEN,
          forced: false,
          visible: true,
        },
        {
          name: 'Yellow',
          x: 28.5,
          y: 81,
          z: -71.5,
          color: WaypointColor.YELLOW,
          forced: false,
          visible: true,
        },
        {
          name: 'Aqua',
          x: 71.5,
          y: 81,
          z: -28.5,
          color: WaypointColor.AQUA,
          forced: false,
          visible: true,
        },
        {
          name: 'White',
          x: 71.5,
          y: 81,
          z: 28.5,
          color: WaypointColor.WHITE,
          forced: false,
          visible: true,
        },
        {
          name: 'Pink',
          x: 28.5,
          y: 81,
          z: 71.5,
          color: WaypointColor.PINK,
          forced: false,
          visible: true,
        },
        {
          name: 'Gray',
          x: -28.5,
          y: 81,
          z: 71.5,
          color: WaypointColor.GRAY,
          forced: false,
          visible: true,
        },
      ],
    },
  ],
};

export default WaypointsMappings;
