import React from "react";
import EventEmitter from "events";
import FileTree from "./FileTree";

interface FileSizeWorkerProps {
  emitter: EventEmitter;
}

interface FileSizeWorkerState {
  totalSize: number;
}

export default class FileSizeWorker extends React.Component<
  FileSizeWorkerProps,
  FileSizeWorkerState
> {
  state = { totalSize: 0 };
  startTime = 0;

  componentDidMount() {
    const { emitter } = this.props;
    emitter.on("receive", this.receiver);

    emitter.emit("send", ".");
  }

  componentWillUnmount() {
    const { emitter } = this.props;
    emitter.off("receive", this.receiver);
  }

  tree: any = {};
  receiver = (data: FileSizeStatus) => {
    if (data.t === "start") {
      this.startTime = Date.now();
    } else if (data.t === "finish") {
      console.log(Date.now() - this.startTime);
    } else if (data.t === "chunk") {
      const files = data.c;
      let chunkSize = 0;
      files.forEach(([pathComponents, size]) => {
        chunkSize += size;

        let ag = this.tree;
        pathComponents.forEach((component, i) => {
          if (i === pathComponents.length - 1) return;

          if (typeof ag[component] === "undefined") {
            ag[component] = {};
          }
          ag = ag[component];
        });

        const fileName = pathComponents[pathComponents.length - 1];
        ag[fileName] = size;
      });

      console.log(this.tree);
      const totalSize = this.state.totalSize + chunkSize;
      this.setState({ totalSize });
    }
  };

  render() {
    const { totalSize } = this.state;

    return (
      <>
        <h3>Total size: {totalSize}</h3>
        <FileTree root="." tree={this.tree} />
      </>
    );
  }
}

type FileSize = [Array<string>, number];

interface FileSizeStatusStart {
  t: "start";
  c: undefined;
}
interface FileSizeStatusChunk {
  t: "chunk";
  c: Array<FileSize>;
}
interface FileSizeStatusFinish {
  t: "finish";
  c: undefined;
}

type FileSizeStatus =
  | FileSizeStatusStart
  | FileSizeStatusChunk
  | FileSizeStatusFinish;
