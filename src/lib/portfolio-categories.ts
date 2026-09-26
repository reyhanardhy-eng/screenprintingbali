const STUDIO_EQUIPMENT_MARKER = "[[STUDIO_EQUIPMENT]]";

export function isStudioEquipmentMeta(meta: string): boolean {
  return meta.startsWith(STUDIO_EQUIPMENT_MARKER);
}

export function getPortfolioCaption(meta: string): string {
  return isStudioEquipmentMeta(meta)
    ? meta.slice(STUDIO_EQUIPMENT_MARKER.length).trimStart()
    : meta;
}

export function setPortfolioCategory(meta: string, studioEquipment: boolean): string {
  const caption = getPortfolioCaption(meta).trim();
  return studioEquipment ? `${STUDIO_EQUIPMENT_MARKER}${caption ? ` ${caption}` : ""}` : caption;
}
