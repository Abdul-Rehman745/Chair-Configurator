export const PARTS = [
  { key: 'frame', label: 'Frame', icon: '/assets/3dModels/model1/1311_0.png', allowColor: true, allowTexture: false },
  { key: 'seat', label: 'Seat & Back', icon: '/assets/3dModels/model1/1311_1.png', allowColor: true, allowTexture: true },
  { key: 'pillows', label: 'Pillows', icon: '/assets/3dModels/model1/1311_2.png', allowColor: true, allowTexture: true },
  { key: 'stitches', label: 'Stitches', icon: '/assets/3dModels/model1/1311_3.png', allowColor: true, allowTexture: false },
  { key: 'armrest', label: 'Armrest', icon: '/assets/3dModels/model1/1311_4.png', allowColor: true, allowTexture: true },
  { key: 'wheels', label: 'Wheels & Legs', icon: '/assets/3dModels/model1/1311_5.png', allowColor: true, allowTexture: false },
] as const;

export const MESH_TO_PART: Record<string, (typeof PARTS)[number]['key']> = {
  skelet_1: 'frame',
  skelet_2: 'frame',
  skelet_3: 'frame',
  skelet_4: 'frame',
  skelet_3_2: 'frame',
  leg: 'frame',
  leg_chrome: 'frame',
  leg_support: 'frame',
  bottom_1: 'seat',
  bottom_2: 'seat',
  backrest: 'seat',
  head_pillow: 'pillows',
  back_pillow: 'pillows',
  stitches: 'stitches',
  stitches_2: 'stitches',
  stitches_3: 'stitches',
  stitches_backrest: 'stitches',
  handles: 'armrest',
  belt_head_pillow: 'armrest',
  belt_back_pillow: 'armrest',
  wheels: 'wheels',
};

export const COLORS = [
  { hex: 'original', label: 'Original' },
  { hex: '#1a1a1a', label: 'Charcoal' },
  { hex: '#f4f0e6', label: 'Ivory' },
  { hex: '#db3a34', label: 'Red' },
  { hex: '#1a3d6f', label: 'Navy' },
  { hex: '#7a4b26', label: 'Brown' },
  { hex: '#1e4620', label: 'Forest' },
  { hex: '#f5a623', label: 'Amber' },
  { hex: '#6c5ce7', label: 'Purple' },
];

export const TEXTURE_OPTIONS = [
  {
    key: 'plain',
    label: 'Plain / Solid',
    preview: '',
    maps: null,
  },
  {
    key: 'fabric',
    label: 'Fabric',
    preview: '/assets/Textures/Fabric010_1K-JPG/Fabric010.png',
    maps: {
      color: '/assets/Textures/Fabric010_1K-JPG/Fabric010_1K-JPG_Color.jpg',
      normal: '/assets/Textures/Fabric010_1K-JPG/Fabric010_1K-JPG_NormalGL.jpg',
      roughness: '/assets/Textures/Fabric010_1K-JPG/Fabric010_1K-JPG_Roughness.jpg',
    },
  },
  {
    key: 'fabric-015',
    label: 'Fabric Knit',
    preview: '/assets/Textures/Fabric015_1K-JPG/Fabric015.png',
    maps: {
      color: '/assets/Textures/Fabric015_1K-JPG/Fabric015_1K-JPG_Color.jpg',
      normal: '/assets/Textures/Fabric015_1K-JPG/Fabric015_1K-JPG_NormalGL.jpg',
      roughness: '/assets/Textures/Fabric015_1K-JPG/Fabric015_1K-JPG_Roughness.jpg',
    },
  },
  {
    key: 'fabric-062',
    label: 'Fabric Denim',
    preview: '/assets/Textures/Fabric062_1K-JPG/Fabric062.png',
    maps: {
      color: '/assets/Textures/Fabric062_1K-JPG/Fabric062_1K-JPG_Color.jpg',
      normal: '/assets/Textures/Fabric062_1K-JPG/Fabric062_1K-JPG_NormalGL.jpg',
      roughness: '/assets/Textures/Fabric062_1K-JPG/Fabric062_1K-JPG_Roughness.jpg',
    },
  },
  {
    key: 'leather-003',
    label: 'Leather Classic',
    preview: '/assets/Textures/Leather003_1K-JPG/Leather003.png',
    maps: {
      color: '/assets/Textures/Leather003_1K-JPG/Leather003_1K-JPG_Color.jpg',
      normal: '/assets/Textures/Leather003_1K-JPG/Leather003_1K-JPG_NormalGL.jpg',
      roughness: '/assets/Textures/Leather003_1K-JPG/Leather003_1K-JPG_Roughness.jpg',
    },
  },
  {
    key: 'leather-025',
    label: 'Leather Grained',
    preview: '/assets/Textures/Leather025_1K-JPG/Leather025.png',
    maps: {
      color: '/assets/Textures/Leather025_1K-JPG/Leather025_1K-JPG_Color.jpg',
      normal: '/assets/Textures/Leather025_1K-JPG/Leather025_1K-JPG_NormalGL.jpg',
      roughness: '/assets/Textures/Leather025_1K-JPG/Leather025_1K-JPG_Roughness.jpg',
    },
  },
  {
    key: 'leather-033a',
    label: 'Leather Premium A',
    preview: '/assets/Textures/Leather033A_1K-JPG/Leather033A.png',
    maps: {
      color: '/assets/Textures/Leather033A_1K-JPG/Leather033A_1K-JPG_Color.jpg',
      normal: '/assets/Textures/Leather033A_1K-JPG/Leather033A_1K-JPG_NormalGL.jpg',
      roughness: '/assets/Textures/Leather033A_1K-JPG/Leather033A_1K-JPG_Roughness.jpg',
    },
  },
  {
    key: 'leather-033c',
    label: 'Leather Brown',
    preview: '/assets/Textures/Leather033C_1K-JPG/Leather033C.png',
    maps: {
      color: '/assets/Textures/Leather033C_1K-JPG/Leather033C_1K-JPG_Color.jpg',
      normal: '/assets/Textures/Leather033C_1K-JPG/Leather033C_1K-JPG_NormalGL.jpg',
      roughness: '/assets/Textures/Leather033C_1K-JPG/Leather033C_1K-JPG_Roughness.jpg',
    },
  },
  {
    key: 'leather-037',
    label: 'Leather Red',
    preview: '/assets/Textures/Leather037_1K-JPG/Leather037.png',
    maps: {
      color: '/assets/Textures/Leather037_1K-JPG/Leather037_1K-JPG_Color.jpg',
      normal: '/assets/Textures/Leather037_1K-JPG/Leather037_1K-JPG_NormalGL.jpg',
      roughness: '/assets/Textures/Leather037_1K-JPG/Leather037_1K-JPG_Roughness.jpg',
    },
  },
  {
    key: 'leather-038',
    label: 'Leather Rugged',
    preview: '/assets/Textures/Leather038_1K-JPG/Leather038.png',
    maps: {
      color: '/assets/Textures/Leather038_1K-JPG/Leather038_1K-JPG_Color.jpg',
      normal: '/assets/Textures/Leather038_1K-JPG/Leather038_1K-JPG_NormalGL.jpg',
      roughness: '/assets/Textures/Leather038_1K-JPG/Leather038_1K-JPG_Roughness.jpg',
    },
  },
];

export const COLOR_FILTERS: Record<string, string[]> = {
  'plain': COLORS.map(c => c.label),
  'fabric': COLORS.map(c => c.label),
  'fabric-015': COLORS.map(c => c.label),
  'fabric-062': COLORS.map(c => c.label),
  'leather-003': ['Original', 'Charcoal', 'Red', 'Navy', 'Brown', 'Forest', 'Purple'],
  'leather-025': ['Original', 'Charcoal', 'Red', 'Navy', 'Brown', 'Forest', 'Purple'],
  'leather-033a': ['Original', 'Charcoal', 'Red', 'Navy', 'Brown', 'Forest', 'Purple'],
  'leather-033c': ['Original', 'Charcoal', 'Red', 'Navy', 'Brown', 'Forest', 'Purple'],
  'leather-037': ['Original', 'Charcoal', 'Red', 'Navy', 'Brown', 'Forest', 'Purple'],
  'leather-038': ['Original', 'Charcoal', 'Red', 'Navy', 'Brown', 'Forest', 'Purple'],
};

export type PartKey = (typeof PARTS)[number]['key'];

export interface PartSettings {
  color?: string;
  textureKey?: string;
}
