namespace secure_cloud_api.Core.Entities.Helpers;

public class KeycloakCertResponse
{
    public List<Key> Keys { get; set; }
}

public class Key
{
    public string Kid { get; set; }
    public string Kty { get; set; }
    public string Alg { get; set; }
    public string Use { get; set; }
    public string N { get; set; }
    public string E { get; set; }
    public List<string> X5c { get; set; }
    public string X5t { get; set; }
    public string X5tS256 { get; set; }
}