
# Frontend

For frontend development GlideLite relies on [Vite](https://vite.dev/) as builder. When initializing a new project, by default GlideLite uses (but is not limited to) [React](https://react.dev/) as library to create interactive and dynamic user interfaces.

All frontend code development should be made in the `frontend` directory. Feel free to update your `Vite` configuration at `frontend/vite.config.ts` as required.

## Error pages

Deployed projects will automatically handle `404 Not Found`, `429 Too Many Requests`, and `500 Internal Server Error` status codes. For this, ensure the following files are available in the `frontend/public` directory:

* _404.html_: displayed when the requested resource is not found.
* _429.html_: displayed when the client is rate limited after performing excessive requests.
* _500.html_: displayed when the server encountered an unexpected condition that prevents fulfilling the request.
