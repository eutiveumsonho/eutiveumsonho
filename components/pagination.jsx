import { Box, Button, Text } from "grommet";
import { Previous, Next } from "grommet-icons";
import { useRouter } from "next/router";

export default function Pagination({ pagination }) {
  const router = useRouter();

  const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;

  const goToPage = (page) => {
    const query = { ...router.query, page };
    if (page === 1) {
      delete query.page;
    }
    router.push({
      pathname: router.pathname,
      query,
    });
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Box 
      direction="row" 
      justify="center" 
      align="center" 
      gap="small" 
      pad={{ top: "medium" }}
    >
      <Button
        icon={<Previous />}
        disabled={!hasPrevPage}
        onClick={() => goToPage(currentPage - 1)}
        hoverIndicator
      />
      
      <Box direction="row" align="center" gap="xsmall">
        {currentPage > 2 && (
          <>
            <Button 
              label="1" 
              onClick={() => goToPage(1)}
              plain
              hoverIndicator
            />
            {currentPage > 3 && <Text>...</Text>}
          </>
        )}
        
        {hasPrevPage && (
          <Button 
            label={currentPage - 1} 
            onClick={() => goToPage(currentPage - 1)}
            plain
            hoverIndicator
          />
        )}
        
        <Button 
          label={currentPage} 
          primary
          disabled
        />
        
        {hasNextPage && (
          <Button 
            label={currentPage + 1} 
            onClick={() => goToPage(currentPage + 1)}
            plain
            hoverIndicator
          />
        )}
        
        {currentPage < totalPages - 1 && (
          <>
            {currentPage < totalPages - 2 && <Text>...</Text>}
            <Button 
              label={totalPages} 
              onClick={() => goToPage(totalPages)}
              plain
              hoverIndicator
            />
          </>
        )}
      </Box>
      
      <Button
        icon={<Next />}
        disabled={!hasNextPage}
        onClick={() => goToPage(currentPage + 1)}
        hoverIndicator
      />
    </Box>
  );
}