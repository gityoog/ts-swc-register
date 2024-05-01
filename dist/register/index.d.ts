type Config = {
    tsconfig?: string;
};
declare let Config: Config;
export default function register(config?: Config): () => void;
export {};
