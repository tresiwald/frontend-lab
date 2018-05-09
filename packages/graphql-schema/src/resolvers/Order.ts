export default {
  __resolveType: object => {
    switch (object.exchange) {
      case 'RADAR_RELAY':
      case 'ERC_DEX':
        return 'ZeroExOrder';
      case 'OASIS_DEX':
        return 'OasisDex';
      default:
        return null;
    }
  },
};
