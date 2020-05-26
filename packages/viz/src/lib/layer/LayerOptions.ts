import { Style, StyleProperties } from '../style';

/**
 * Options of the layer
 */
export interface LayerOptions {
  /**
   * id of the layer
   */
  id: string;

  /**
   * This callback will be called when the mouse
   * clicks over an object of this layer.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (info: any, event: any) => void;

  /**
   * This callback will be called when the mouse enters/leaves
   * an object of this layer.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onHover?: (info: any, event: any) => void;

  /**
   * Whether the layer responds to mouse pointer picking events.
   */
  pickable?: boolean;

  /**
   * Style defined for those features which are hovered
   * by the user.
   */
  hoverStyle?: Style | StyleProperties | string;

  /**
   * Style defined for those features which are clicked
   * by the user.
   */
  clickStyle?: Style | StyleProperties | string;
}
