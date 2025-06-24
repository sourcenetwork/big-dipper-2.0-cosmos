import chainCoing from '@/chainConfig';
import useStyles from '@/components/ChainIcon/useStyles';
import Image, { type ImageProps } from 'next/image';
import sourcehubLogo from 'shared-utils/assets/logos/sourcehub.svg?url';
import sourcehubLogoDark from 'shared-utils/assets/logos/sourcehub_dark.svg?url';
import sourcehubIcon from 'shared-utils/assets/icons/sourcehub-light.svg?url';

interface IconProps extends Omit<ImageProps, 'id' | 'src'> {
  type: 'icon' | 'logo';
  chainName?: string;
}

const ChainIcon = ({
  className,
  type,
  chainName = chainCoing().chainName,
  ...props
}: IconProps) => {
  const { classes, cx } = useStyles();

  const [iconDark, iconLight] =
    type === 'icon' ? [sourcehubIcon, sourcehubIcon] : [sourcehubLogo, sourcehubLogoDark];
  return (
    <span className={cx(className, classes.container)}>
      <Image width={0} height={0} src={iconDark} {...props} className={classes.dark} unoptimized />
      <Image
        width={0}
        height={0}
        src={iconLight}
        {...props}
        className={classes.light}
        unoptimized
      />
    </span>
  );
};

export default ChainIcon;
