const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMjAyMDMzMTE3MUByZXZhLmVkdS5pbiIsImV4cCI6MTc1NjcwMzU1MiwiaWF0IjoxNzU2NzAyNjUyLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiY2FkYWVmZjMtMzUxNS00ODVjLWJmNmEtYjA1MmNiNmRjYzJlIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoidmVubmFwdXNhIHNyaW5hdGggcmVkZHkiLCJzdWIiOiI1OWIwNDg0OC1jZGExLTQ2YTQtOTI2Mi04NjYwZDk1N2M2ZjAifSwiZW1haWwiOiIyMjAyMDMzMTE3MUByZXZhLmVkdS5pbiIsIm5hbWUiOiJ2ZW5uYXB1c2Egc3JpbmF0aCByZWRkeSIsInJvbGxObyI6InIyMmVoMTc2IiwiYWNjZXNzQ29kZSI6Ik5KTUtEVyIsImNsaWVudElEIjoiNTliMDQ4NDgtY2RhMS00NmE0LTkyNjItODY2MGQ5NTdjNmYwIiwiY2xpZW50U2VjcmV0IjoicFFGY1dZUXFHZnd5UXpjZiJ9.xlmynJLaC3WzFfiko9GPl7L-eCogQKMcrc0sxpuETFw";

const BACKEND_PACKAGES = ["cache", "controller", "cron_job", "db", "domain", "handler", "repository", "route", "service"];
const FRONTEND_PACKAGES = ["api", "component", "hook", "page", "state", "style"];
const SHARED_PACKAGES = ["auth", "config", "middleware", "utils"];

async function Log(stack: string, level: string, pkg: string, message: string) {
  const validPkgs = [...SHARED_PACKAGES, ...(stack === "backend" ? BACKEND_PACKAGES : FRONTEND_PACKAGES)];
  if (!validPkgs.includes(pkg)) return { error: `Invalid package: ${pkg} for ${stack}` };
  
  try {
    const response = await fetch("http://20.244.56.144/evaluation-service/logs", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ stack, level, package: pkg, message })
    });
    
    return response.ok ? await response.json() : { error: response.statusText };
  } catch (error: any) {
    return { error: error.message };
  }
}

export { Log };
