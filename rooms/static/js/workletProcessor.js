class WorkletProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
      const input = inputs[0];
      const output = outputs[0];
      output.forEach((channel, channelIndex) => {
        channel.set(input[channelIndex]);
      });
      return true;
    }
  }
  
  registerProcessor('workletProcessor', WorkletProcessor);