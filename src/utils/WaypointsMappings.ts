import {
  WaypointsMappings as _WaypointsMappings,
  WaypointColors,
} from '../Types';

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
          color: WaypointColors.RED,
        },
        {
          name: 'Blue',
          x: 29.5,
          y: 66,
          z: -75.5,
          color: WaypointColors.BLUE,
        },
        {
          name: 'Green',
          x: 78.5,
          y: 66,
          z: -26.5,
          color: WaypointColors.GREEN,
        },
        {
          name: 'Yellow',
          x: 78.5,
          y: 66,
          z: 26.5,
          color: WaypointColors.YELLOW,
        },
        {
          name: 'Aqua',
          x: 29.5,
          y: 66,
          z: 75.5,
          color: WaypointColors.AQUA,
        },
        {
          name: 'White',
          x: -23.5,
          y: 66,
          z: 75.5,
          color: WaypointColors.WHITE,
        },
        {
          name: 'Pink',
          x: -72.5,
          y: 66,
          z: 26.5,
          color: WaypointColors.PINK,
        },
        {
          name: 'Gray',
          x: -72.5,
          y: 66,
          z: -26.5,
          color: WaypointColors.GRAY,
        },
      ],
    },
  ],
};

export default WaypointsMappings;
