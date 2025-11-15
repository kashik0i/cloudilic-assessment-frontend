import {InputNode} from "./input-node.tsx";
import {RagNode} from "./rag-node.tsx";
import {OutputNode} from "./output-node.tsx";
import type {NodeTypes} from "@xyflow/react";

export const nodeTypes = {
    inputNode: InputNode,
    ragNode: RagNode,
    outputNode: OutputNode,
} as NodeTypes;

export { InputNode, RagNode, OutputNode};
