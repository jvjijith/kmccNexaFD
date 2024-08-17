import clsx from "clsx";

export default function Image({ path = '1', className = 'w-4 h-4' }) {
    return (
      <img
        src={path!=='1'?path:`https://png.pngtree.com/png-vector/20220807/ourmid/pngtree-man-avatar-wearing-gray-suit-png-image_6102786.png`}
        alt=""
        className={clsx(className, 'rounded-full')}
      />
    );
  }
  