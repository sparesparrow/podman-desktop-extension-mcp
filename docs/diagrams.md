# Architecture and Design Diagrams

This document provides an overview of the project's architecture and source code design for the MCP Server Manager Extension.

It is organized as follows:

- A brief explanation of the source code structure.
- A **Class Diagram** showing key classes and their relationships.
- A **Flowchart** that illustrates the sequence of operations when starting a server.
- A **State Machine Diagram** describing the different provider statuses.
- A **Sequence Diagram** representing the interactions that occur during the server start process.
- A **Package Diagram** that shows the repository structure (based on `package.json` and related files).

> **Note:** If some parts need further refinement, please replace the placeholder comments with more detailed information and diagrams.

---

## Source Code Structure Overview

The project is organized as follows:

- **src/**
  - **core/**
    - `mcp-client.ts`: Contains the MCP client implementations and the client factory.
  - **health/**
    - `health-check.service.ts`: Implements health check strategies using HTTP GET or exec commands.
  - **settings/**
    - `MCPSettings.ts`: Manages extension configuration settings.
  - **types/**
    - `mcp-types.ts`: Declares types and interfaces for MCP server configurations, errors, etc.
    - `modelcontextprotocol-sdk.d.ts`: Provides type definitions for the external MCP SDK.
  - **ui/**
    - `MCPServerManager.tsx`: React component for the MCP Server Manager user interface.
  - Root-level source files:
    - `mcp-server-manager.ts`: Main class that handles server lifecycle operations (start/stop, health checks).
    - `mcp-server-service.ts`: Provides higher-level operations for managing MCP servers.
    - `mcp-router.ts`: Routes commands to appropriate MCP clients.
- **.github/** folder and other files (e.g., `package.json`, `tsconfig.json`, etc.) handle project configuration, CI, and dependency management.

---

## Mermaid Diagrams

### 1. Class Diagram

This diagram shows the key classes and their interdependencies.

```mermaid
%% Class Diagram for Key Components
classDiagram
    direction LR

    class Extension {
        +activate(context: ExtensionContext)
        +deactivate()
    }
    class CommandRegistrar {
        +registerCommands(context: ExtensionContext, serverManager: MCPServerManager)
    }
    class MCPServerManager {
        <<interface>>
        +startServer(config: MCPServerConfig): Promise<void>
        +stopServer(serverName: string): Promise<void>
        +listServers(): Promise<MCPServerStatus[]>
        +getServerStatus(serverName: string): Promise<MCPServerStatus>
        +listServerTools(serverName: string): Promise<any[]>
        +callServerTool(serverName: string, toolName: string, args: any): Promise<any>
        +listServerResources(serverName: string): Promise<any[]>
        +readServerResource<T>(serverName: string, uri: string): Promise<T>
        +listServerPrompts(serverName: string): Promise<any[]>
        +getServerPrompt<T>(serverName: string, promptName: string): Promise<T>
        +isServerConnected(serverName: string): boolean
        +getConnectedServers(): string[]
        +dispose(): void
    }
    class MCPServerServiceImpl {
        +startServer(config: MCPServerConfig): Promise<void>
        +stopServer(serverName: string): Promise<void>
        +listServers(): Promise<MCPServerStatus[]>
        +getServerStatus(serverName: string): Promise<MCPServerStatus>
        +listServerTools(serverName: string): Promise<any[]>
        +callServerTool(serverName: string, toolName: string, args: any): Promise<any>
        +listServerResources(serverName: string): Promise<any[]>
        +readServerResource<T>(serverName: string, uri: string): Promise<T>
        +listServerPrompts(serverName: string): Promise<any[]>
        +getServerPrompt<T>(serverName: string, promptName: string): Promise<T>
        +isServerConnected(serverName: string): boolean
        +getConnectedServers(): string[]
        +dispose(): void
    }
    class HealthCheckService {
        +checkHealth(config: MCPServerConfig): Promise<boolean>
        -getCheckStrategy(config: MCPServerConfig): HealthCheckStrategy
    }
    class HealthCheckStrategy {
        <<interface>>
        +check(): Promise<boolean>
    }
    class HttpHealthCheck {
        +check(): Promise<boolean>
    }
    class ExecHealthCheck {
        +check(): Promise<boolean>
    }
    class PodmanService {
        <<interface>>
        +runContainer(config: MCPServerConfig): Promise<string>
        +stopContainer(containerId: string): Promise<void>
        +listContainers(labels?: Record<string, string>): Promise<any[]>
        +getContainerStatus(containerId: string): Promise<string>
    }
    class PodmanServiceImpl {
        +runContainer(config: MCPServerConfig): Promise<string>
        +stopContainer(containerId: string): Promise<void>
        +listContainers(labels?: Record<string, string>): Promise<any[]>
        +getContainerStatus(containerId: string): Promise<string>
    }
    class MCPRouter {
        +connectServer(config: MCPServerConfig): Promise<void>
        +disconnectServer(name: string): Promise<void>
        +listServerTools(name: string): Promise<any[]>
        +callServerTool(name: string, toolName: string, args: any): Promise<any>
        +listServerResources(name: string): Promise<any[]>
        +readServerResource<T>(name: string, uri: string): Promise<T>
        +listServerPrompts(name: string): Promise<any[]>
        +getServerPrompt(name: string, promptName: string): Promise<any>
        +isServerConnected(name: string): boolean
        +getConnectedServers(): string[]
        +dispose(): void
    }
    class MCPClient {
        <<interface>>
        +connect(): Promise<void>
        +disconnect(): Promise<void>
        +send(message: any): Promise<void>
        +receive(): Promise<any>
        +listTools(): Promise<ToolDefinition[]>
        +callTool(name: string, args: any): Promise<any>
        +listResources(): Promise<string[]>
        +readResource<T>(uri: string): Promise<T>
        +listPrompts(): Promise<string[]>
        +getPrompt<T>(name: string): Promise<T>
        +isConnected(): boolean
    }
    class TypedMCPClient {
        +connect(): Promise<void>
        +disconnect(): Promise<void>
        +send(message: any): Promise<void>
        +receive(): Promise<any>
        +listTools(): Promise<ToolDefinition[]>
        +callTool(name: string, args: any): Promise<any>
        +listResources(): Promise<string[]>
        +readResource<T>(uri: string): Promise<T>
        +listPrompts(): Promise<string[]>
        +getPrompt<T>(name: string): Promise<T>
        +isConnected(): boolean
    }
    class Transport {
        <<interface>>
        +connect(): Promise<void>
        +disconnect(): Promise<void>
        +send(message: any): Promise<void>
        +receive(): Promise<any>
    }


    Extension --|> CommandRegistrar : uses
    Extension --|> MCPServerManager : uses
    MCPServerServiceImpl --|> MCPServerManager : implements
    MCPServerServiceImpl --|> HealthCheckService : uses
    MCPServerServiceImpl --|> PodmanService : uses
    MCPServerServiceImpl --|> MCPRouter : uses
    HealthCheckService ..> HealthCheckStrategy : uses strategy
    HttpHealthCheck --|> HealthCheckStrategy : implements
    ExecHealthCheck --|> HealthCheckStrategy : implements
    MCPServerServiceImpl --|> MCPClient : uses
    TypedMCPClient --|> MCPClient : implements
    TypedMCPClient --|> Transport : uses
    MCPRouter --|> MCPClient : uses

    style Extension fill:#f8f9fa,stroke:#ccc,stroke-width:1px
    style CommandRegistrar fill:#f8f9fa,stroke:#ccc,stroke-width:1px
    style MCPServerManager fill:#e0f7fa,stroke:#80deea,stroke-width:2px
    style MCPServerServiceImpl fill:#f8f9fa,stroke:#ccc,stroke-width:1px
    style HealthCheckService fill:#f8f9fa,stroke:#ccc,stroke-width:1px
    style HealthCheckStrategy fill:#e0f7fa,stroke:#80deea,stroke-width:2px
    style HttpHealthCheck fill:#f8f9fa,stroke:#ccc,stroke-width:1px
    style ExecHealthCheck fill:#f8f9fa,stroke:#ccc,stroke-width:1px
    style PodmanService fill:#e0f7fa,stroke:#80deea,stroke-width:2px
    style PodmanServiceImpl fill:#f8f9fa,stroke:#ccc,stroke-width:1px
    style MCPRouter fill:#f8f9fa,stroke:#ccc,stroke-width:1px
    style MCPClient fill:#e0f7fa,stroke:#80deea,stroke-width:2px
    style TypedMCPClient fill:#f8f9fa,stroke:#ccc,stroke-width:1px
    style Transport fill:#e0f7fa,stroke:#80deea,stroke-width:2px
```

---

### 2. Flowchart Diagram

This flowchart illustrates the major steps when a user requests to start a server.

```mermaid
%% Flowchart for Starting a Server Process
flowchart TD
    A[Start Server Request] --> B[Update provider status to 'starting']
    B --> C[Check for existing container]
    C --> D{Container Exists?}
    D -- Yes --> E[Update provider status to 'error' & throw error]
    D -- No --> F[Build the podman run command]
    F --> G[Execute command to start container]
    G --> H[Check container ID returned]
    H --> I{Is Container ID Valid?}
    I -- No --> J[Update provider status to 'error' & throw error]
    I -- Yes --> K[Store server configuration and trigger health check]
    K --> L[Update provider status to 'ready']
    L --> M[Display information message to user]
```

---

### 3. State Machine Diagram

This diagram represents the provider status transitions during server lifecycle operations.

```mermaid
%% State Machine Diagram for Provider States
stateDiagram-v2
    [*] --> ready
    ready --> starting : startServer
    starting --> ready : success
    starting --> error : failure
    ready --> stopping : stopServer
    stopping --> stopped : success
    stopping --> error : failure
    error --> ready : retry/resolve
```

---

### 4. Sequence Diagram

This diagram shows the sequence of interactions when a server is started.

```mermaid
%% Sequence Diagram for Starting a Server
sequenceDiagram
    participant UI as User Interface
    participant Mngr as MCPServerManager
    participant Exec as execAsync (Podman Command Executor)
    participant Provider as Provider (Extension API)
    participant Router as MCPRouter

    UI->>Mngr: startServer(config)
    Mngr->>Provider: updateStatus("starting")
    Mngr->>Exec: Execute "podman ps -a" to check for container
    Exec-->>Mngr: Existing container check result
    alt Container Exists
       Mngr->>Provider: updateStatus("error")
       Mngr->>UI: throw error "Server already exists"
    else No Container Exists
       Mngr->>Exec: Execute "podman run -d ..." to start container
       Exec-->>Mngr: Returns container ID
       Mngr->>Mngr: Initiate health check (startHealthCheck)
       Mngr->>Router: connectServer(config)
       Mngr->>Provider: updateStatus("ready")
       Mngr->>UI: showInformationMessage("Server started with container ID")
    end
```

---

### 5. Package Diagram

This diagram outlines the repository's package-related files and their high-level relationships.

```mermaid
%% Package Diagram for Repository Structure
graph TD
    A[package.json] --> B[README.md]
    A --> C[tsconfig.json]
    A --> D[.gitattributes]
    A --> E[.github/dependabot.yml]
    A --> F[.github/workflows/pr-check.yaml]
    A --> G[src/]
```

---

## Placeholders & Instructions for Further Detail

If any of the diagrams or sections require further detail, please insert the following instructions at the appropriate locations:

- **[Placeholder for Extended Class Diagram]:**  
  _"Please expand the class diagram to include additional classes (for example, error classes and mocks) and their relationships where applicable. Include methods and properties that are critical for understanding interactions."_

- **[Placeholder for Extended Package Diagram]:**  
  _"Detail the relationship between the build tools (pnpm, eslint, jest) and the configuration files. Include any additional files like `.editorconfig` or custom scripts if present in the repository."_ 

- **[Additional Flow Details]:**  
  _"Include any additional branches or error handling paths that were merged after the recent feature updates. Verify that the container lifecycle (start/stop/dispose) is fully represented."_

Please replace these placeholders with finalized diagrams and detailed comments before release.

---

This documentation should serve as a strong foundation for understanding the project architecture and guiding further development.

Happy documenting! 