import { PropsWithChildren, ReactElement } from 'react';
// import { Grid, GridSize } from '@mui/material';
// import makeStyles from '@mui/styles/makeStyles';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import { getInstructions } from '@pega/react-sdk-components/lib/components/helpers/template-utils';

interface TwoColumnProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  templateCol?: string;
  instructions: string;
}

export default function TwoColumn(props: PropsWithChildren<TwoColumnProps>) {
  const { getPConnect, children } = props;
  const childrenToRender = children as ReactElement[];
  const instructions = getInstructions(getPConnect());

  if (childrenToRender.length !== 2) {
    // eslint-disable-next-line no-console
    console.error(`TwoColumn template sees more than 2 columns: ${childrenToRender.length}`);
  }

  return (
    // <Grid container spacing={1}>
    //   <Grid item xs={12} md={aSize} className={classes.colStyles}>
    //     {childrenToRender[0]}
    //   </Grid>
    //   <Grid item xs={12} md={bSize} className={classes.colStyles}>
    //     {childrenToRender[1]}
    //   </Grid>
    // </Grid>
    <>
        {instructions?
            <div dangerouslySetInnerHTML={{ __html: instructions }} key='instructions' className="my-2"/>
        :null}
        <div className='grid grid-cols-2 gap-2'>
            <div className="flex flex-col space-y-4">
                {childrenToRender[0]}
            </div>
            <div className="flex flex-col space-y-4">
                {childrenToRender[1]}
            </div>
        </div>
    </>
  );
}
