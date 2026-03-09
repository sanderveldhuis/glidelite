
# User Interface

For frontend development GlideLite relies on [Vite](https://vite.dev/) as builder. When initializing a new project, by default GlideLite uses (but is not limited to) [React](https://react.dev/) as library to create interactive and dynamic user interfaces.

All frontend code development should be made in the `frontend` directory. Feel free to update your `Vite` configuration at `frontend/vite.config.ts` as required.

## Error pages

Deployed projects will automatically handle `404 Not Found`, `429 Too Many Requests`, and `500 Internal Server Error` status codes. For this, ensure the following files are available in the `frontend/public` directory:

* _404.html_: displayed when the requested resource is not found.
* _429.html_: displayed when the client is rate limited after performing excessive requests.
* _500.html_: displayed when the server encountered an unexpected condition that prevents fulfilling the request.

# Further reading

Continue your journey into GlideLite:

* [Configuration](https://github.com/sanderveldhuis/glidelite/blob/main/doc/configuration.md)
* Backend
  * [API](https://github.com/sanderveldhuis/glidelite/blob/main/doc/api.md)
  * [Workers](https://github.com/sanderveldhuis/glidelite/blob/main/doc/workers.md)
  * [Use configurations](https://github.com/sanderveldhuis/glidelite/blob/main/doc/use-configurations.md)
  * [Use dependencies](https://github.com/sanderveldhuis/glidelite/blob/main/doc/use-dependencies.md)
  * [Logging](https://github.com/sanderveldhuis/glidelite/blob/main/doc/logging.md)
  * [Inter-process communication](https://github.com/sanderveldhuis/glidelite/blob/main/doc/ipc.md)
* Frontend
  * [User interface](https://github.com/sanderveldhuis/glidelite/blob/main/doc/ui.md)
  * [API requests](https://github.com/sanderveldhuis/glidelite/blob/main/doc/api-requests.md)
* [Deployment](https://github.com/sanderveldhuis/glidelite/blob/main/doc/deployment.md)
