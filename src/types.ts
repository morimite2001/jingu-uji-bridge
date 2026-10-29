import * as THREE from 'three';

export type StructureLayer = 'all' | 'deck' | 'railings' | 'substructure' | 'river' | 'approaches';
export type ArchitecturalLayer = StructureLayer; // alias for compatibility

export type SurfaceCondition = 'wet' | 'dry';

export interface Viewpoint {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  photoRef: string;
  desc: string;
  camPos: THREE.Vector3;
  camTarget: THREE.Vector3;
  pinPos: THREE.Vector3;
  highlights: string[];
}

export interface AnnotationPin {
  id: string;
  title: string;
  shortLabel: string;
  pos: THREE.Vector3;
  viewpointId: string;
}
