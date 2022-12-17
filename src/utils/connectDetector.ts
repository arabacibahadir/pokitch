class ConnectDetector {
  public connects = Array();

  setConnect = (channel: string) => {
    return this.connects.push(channel);
  };

  getConnect = (channel: string) => {
    return this.connects.includes(channel);
  };
}

export const connectDetector = new ConnectDetector();
