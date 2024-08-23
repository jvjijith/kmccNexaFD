import React from 'react';
import Container from "../../layout/component/container";
import ErrorCard from '../../layout/component/errorCard';
import ErrorComponent from '../../layout/component/error';

function ErrorPage() {

  return (
    <Container>
      {/* <ErrorCard> */}
        <ErrorComponent />
      {/* </ErrorCard> */}
    </Container>
  );
}

export default ErrorPage;
