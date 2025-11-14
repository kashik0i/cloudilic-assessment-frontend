// @flow

type Props = {

};

export function DebugNode(props: Props) {

    return (
        <div>
            {JSON.stringify(nodes)}
            <br/>
            {JSON.stringify(edges)}
        </div>
    );
};