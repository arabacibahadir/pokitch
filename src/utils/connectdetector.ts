class ConnectDetector {
  public connectedChannels = Array();

  set connected(channelName: string) {
    this.connectedChannels.push(channelName);
  }

  checkConnected(channelName: string) {
    return this.connectedChannels.includes(channelName);
  }
}

export const connectdetector = new ConnectDetector();
