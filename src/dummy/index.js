export const map = (value, sMin, sMax, dMin, dMax) => {
    return dMin + ((value - sMin) / (sMax - sMin)) * (dMax - dMin);
  };
  export const pi = Math.PI;
  export const tau = 2 * pi;
  
  
  
  export const graphData = [
    'Nov',
    'Dec',
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'June',
    'July',
  ].map((i) => {
    const revenue = 500 + Math.random() * 2000;
    const expectedRevenue = Math.max(revenue + (Math.random() - 0.5) * 2000, 0);
    return {
      name: i,
      revenue,
      expectedRevenue,
      sales: Math.floor(Math.random() * 500),
    };
  });
  