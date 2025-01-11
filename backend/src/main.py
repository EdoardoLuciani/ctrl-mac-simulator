from config import configure_parser_and_get_args
from app import setup_simulation


if __name__ == "__main__":
    args = configure_parser_and_get_args()

    if args.server:
        import uvicorn
        uvicorn.run("app:app", host=args.host, port=args.port, workers=args.workers, reload=args.reload)
    else:
        env, _, _, _, _, _, _ = setup_simulation(**vars(args))
        env.run()
