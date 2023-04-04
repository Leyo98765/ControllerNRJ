const Gpio = import('onoff').Gpio;
const clk = new Gpio(17, 'in', 'both');
const dt = new Gpio(18, 'in', 'both');

let counter = 0;
let clkLastState = clk.readSync();

clk.watch((err, clkState) => {
  if (err) {
    throw err;
  }

  const dtState = dt.readSync();

  if (clkState !== clkLastState) {
    if (dtState !== clkState) {
      counter += 1;
    } else {
      counter -= 1;
    }

    console.log(counter);
  }

  clkLastState = clkState;
});

process.on('SIGINT', () => {
  clk.unexport();
  dt.unexport();
});
