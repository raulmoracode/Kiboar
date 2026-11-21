declare module "occt-import-js" {
  export interface OcctMesh {
    attributes: {
      position: { array: Float32Array | number[] };
      normal?: { array: Float32Array | number[] };
    };
    index?: { array: Uint32Array | number[] };
    color?: [number, number, number];
  }

  export interface OcctResult {
    success: boolean;
    meshes?: OcctMesh[];
  }

  export interface OcctInstance {
    ReadStepFile(buffer: Uint8Array, params: unknown): OcctResult;
  }

  export default function occtimportjs(options: {
    locateFile: (path: string) => string;
  }): Promise<OcctInstance>;
}
