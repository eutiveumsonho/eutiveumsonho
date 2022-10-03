import { Box, Button } from "grommet";
import { Star, Tip } from "grommet-icons";
import { useRouter } from "next/router";

export default function DreamFooter(props) {
  const {
    commentCount,
    starCount,
    updatingStarCount,
    unstar,
    color,
    canUnstar,
    star,
    item,
  } = props;
  const { push } = useRouter();

  return (
    <Box pad="medium" direction="row" gap="large">
      <Button
        hoverIndicator
        icon={<Tip />}
        badge={commentCount}
        onClick={() => {
          push(`/sonhos/${item._id}#comentar`);
        }}
      />
      <Button
        hoverIndicator
        icon={<Star color={color} />}
        badge={starCount}
        disabled={updatingStarCount}
        onClick={() => (canUnstar ? unstar() : star())}
      />
    </Box>
  );
}
