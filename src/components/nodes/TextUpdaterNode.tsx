import {useCallback} from "react";

type Props = {};

export function TextUpdaterNode(props: Props) {
    const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(event.target.value);
    }, []);

    return (
        <div className="text-updater-node">
            <div>
                <label htmlFor="text">Text:</label>
                <input id="text" name="text" onChange={onChange} className="no-drag"/>
            </div>
        </div>
    );
}