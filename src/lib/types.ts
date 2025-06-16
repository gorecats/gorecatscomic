export type SvgIconProps = { className?: React.SVGProps<SVGSVGElement>['className'] }
export type VariantSvgIconProps = { solid?: boolean } & SvgIconProps

export type Comic = {
    image: string,
    rarity: string
}